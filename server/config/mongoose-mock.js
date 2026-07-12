const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Simple helper to generate MongoDB-like ObjectId strings
function generateId() {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

class Schema {
  constructor(definition, options) {
    this.definition = definition;
    this.options = options;
    this.statics = {};
    this.methods = {};
    this._pres = {};
  }

  pre(hookName, fn) {
    if (!this._pres[hookName]) {
      this._pres[hookName] = [];
    }
    this._pres[hookName].push(fn);
  }

  static get Types() {
    return {
      ObjectId: 'ObjectId'
    };
  }
}

// In mongoose, Schema.Types is also defined
Schema.Types = {
  ObjectId: 'ObjectId'
};

const models = {};

function model(name, schema) {
  if (models[name]) {
    return models[name];
  }

  const filePath = path.join(__dirname, `../db_${name.toLowerCase()}s.json`);

  // Ensure JSON file exists
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
  }

  function readData() {
    try {
      if (!fs.existsSync(filePath)) {
        return [];
      }
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      return [];
    }
  }

  function writeData(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  class Model {
    constructor(data = {}) {
      Object.assign(this, data);
      if (!this._id) {
        this._id = generateId();
      }

      // Apply default values from schema
      if (schema && schema.definition) {
        for (const [fieldName, fieldConfig] of Object.entries(schema.definition)) {
          if (this[fieldName] === undefined && fieldConfig && fieldConfig.default !== undefined) {
            this[fieldName] = typeof fieldConfig.default === 'function' ? fieldConfig.default() : fieldConfig.default;
          }
        }
      }
      
      // Copy schema methods to instance
      if (schema && schema.methods) {
        for (const [methodName, fn] of Object.entries(schema.methods)) {
          this[methodName] = fn.bind(this);
        }
      }
    }

    // Check if password or field is modified
    isModified(field) {
      return true; 
    }

    async save() {
      // Run pre-save hooks
      if (schema && schema._pres && schema._pres['save']) {
        for (const fn of schema._pres['save']) {
          await new Promise((resolve, reject) => {
            let resolved = false;
            const done = (err) => {
              if (resolved) return;
              resolved = true;
              if (err) reject(err);
              else resolve();
            };
            try {
              const res = fn.call(this, done);
              if (res && typeof res.then === 'function') {
                res.then(() => done(), reject);
              }
            } catch (err) {
              reject(err);
            }
          });
        }
      }

      // Add timestamps
      if (schema && schema.options && schema.options.timestamps) {
        const now = new Date().toISOString();
        if (!this.createdAt) {
          this.createdAt = now;
        }
        this.updatedAt = now;
      }

      const dataList = readData();
      const index = dataList.findIndex(item => item._id === this._id);
      
      // Strip out methods from plain object
      const plainObj = {};
      for (const [key, value] of Object.entries(this)) {
        if (typeof value !== 'function') {
          plainObj[key] = value;
        }
      }

      if (index >= 0) {
        dataList[index] = plainObj;
      } else {
        dataList.push(plainObj);
      }

      writeData(dataList);
      return this;
    }

    static find(query = {}) {
      const dataList = readData();
      let filtered = dataList.map(item => new Model(item));

      if (Object.keys(query).length > 0) {
        filtered = filtered.filter(item => {
          for (const [key, val] of Object.entries(query)) {
            if (String(item[key]) !== String(val)) return false;
          }
          return true;
        });
      }

      return new Query(filtered);
    }

    static findOne(query = {}) {
      const dataList = readData();
      let found = null;
      for (const item of dataList) {
        let match = true;
        for (const [key, val] of Object.entries(query)) {
          if (String(item[key]) !== String(val)) {
            match = false;
            break;
          }
        }
        if (match) {
          found = new Model(item);
          break;
        }
      }
      return new Query(found);
    }

    static findById(id) {
      const dataList = readData();
      const item = dataList.find(item => item._id === String(id));
      const modelInst = item ? new Model(item) : null;
      return new Query(modelInst);
    }

    static async countDocuments(query = {}) {
      const results = await this.find(query);
      return Array.isArray(results) ? results.length : (results ? 1 : 0);
    }

    static async create(data) {
      const inst = new Model(data);
      await inst.save();
      return inst;
    }
  }

  class Query {
    constructor(result) {
      this.result = result;
    }

    populate(pathName, select) {
      const isArray = Array.isArray(this.result);
      const items = isArray ? this.result : [this.result];

      for (const item of items) {
        if (!item) continue;
        
        if (pathName === 'user' && item.user) {
          try {
            const usersFilePath = path.join(__dirname, '../db_users.json');
            if (fs.existsSync(usersFilePath)) {
              const dataList = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
              const userId = typeof item.user === 'object' ? (item.user._id || item.user.id) : item.user;
              const userObj = dataList.find(u => u._id === String(userId));
              if (userObj) {
                item.user = { _id: userObj._id, name: userObj.name, email: userObj.email, role: userObj.role };
              }
            }
          } catch (e) {
            console.error('Error populating user:', e);
          }
        } else if (pathName === 'seller' && item.seller) {
          try {
            const usersFilePath = path.join(__dirname, '../db_users.json');
            if (fs.existsSync(usersFilePath)) {
              const dataList = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
              const sellerId = typeof item.seller === 'object' ? (item.seller._id || item.seller.id) : item.seller;
              const userObj = dataList.find(u => u._id === String(sellerId));
              if (userObj) {
                item.seller = { _id: userObj._id, name: userObj.name, email: userObj.email, role: userObj.role };
              }
            }
          } catch (e) {
            console.error('Error populating seller:', e);
          }
        }
      }
      return this;
    }

    select(fields) {
      const isArray = Array.isArray(this.result);
      const items = isArray ? this.result : [this.result];
      
      if (typeof fields === 'string' && fields.startsWith('-')) {
        const fieldToRemove = fields.substring(1);
        for (const item of items) {
          if (item) {
            delete item[fieldToRemove];
          }
        }
      }
      return this;
    }

    // Support thenable
    then(onfulfilled, onrejected) {
      return Promise.resolve(this.result).then(onfulfilled, onrejected);
    }
  }

  models[name] = Model;
  return Model;
}

const mockMongoose = {
  Schema,
  model,
  connect: async () => {
    console.log('Mock MongoDB Connected Successfully (Local JSON Mode)');
    return mockMongoose;
  },
  connection: { host: 'localhost-mock-json' }
};

module.exports = mockMongoose;
