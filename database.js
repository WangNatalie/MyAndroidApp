import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

const database_name = "Skincare.db";
const database_version = "1.0";
const database_displayname = "Skincare Database";
const database_size = 200000;

export default class DatabaseService {
  initDB() {
    return new Promise((resolve, reject) => {
      SQLite.openDatabase(
        database_name,
        database_version,
        database_displayname,
        database_size
      ).then(DB => {
        this.db = DB;
        this.db.executeSql('SELECT 1 FROM User LIMIT 1').then(() => {
          console.log("Database is ready, tables exist");
          resolve(DB);
        }).catch((error) => {
          console.log("Database is not ready, creating tables");
          this.db.transaction((tx) => {
            // Create User table
            tx.executeSql(
              'CREATE TABLE IF NOT EXISTS User (userId INTEGER PRIMARY KEY AUTOINCREMENT, age INTEGER, skinType TEXT, medications TEXT, allergies TEXT, skinConcerns TEXT)'
            );
            // Create Product table (global catalog)
            tx.executeSql(
              'CREATE TABLE IF NOT EXISTS Product (productId INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, brand TEXT, category TEXT, ingredients TEXT, recommendedUsage TEXT)'
            );
            // Create UserProduct table (junction table)
            tx.executeSql(
              'CREATE TABLE IF NOT EXISTS UserProduct (userProductId INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, productId INTEGER, purchaseDate TEXT, openedDate TEXT, expiryDate TEXT, usageFrequency TEXT, notes TEXT, FOREIGN KEY (userId) REFERENCES User(userId), FOREIGN KEY (productId) REFERENCES Product(productId))'
            );
          }).then(() => {
            console.log("Tables created successfully");
            resolve(DB);
          }).catch(error => {
            console.log("Error creating tables: " + error);
            reject(error);
          });
        });
      }).catch(error => {
        console.log("Error opening database: " + error);
        reject(error);
      });
    });
  }

  // User methods
  createUser(user) {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO User (age, skinType, medications, allergies, skinConcerns) VALUES (?, ?, ?, ?, ?)',
          [user.age, user.skinType, JSON.stringify(user.medications), JSON.stringify(user.allergies), JSON.stringify(user.skinConcerns)]
        ).then(([tx, results]) => {
          resolve(results);
        }).catch(error => {
          reject(error);
        });
      });
    });
  }

  // Add more methods for CRUD operations
  // For products, user products, etc.
}