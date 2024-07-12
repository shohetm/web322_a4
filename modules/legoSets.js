const setData = require('../data/setData.json');
const themeData = require('../data/themeData');

let sets = []; 


function Initialize() {
  return new Promise((resolve, reject) => {
      try {
          sets = setData.map(set => {
              const theme = themeData.find(theme => theme.id === set.theme_id);
              return {
                  ...set,
                  theme: theme ? theme.name : "Unknown"
              };
          });
          resolve();
      } catch (error) {
          reject(error);
      }
  });
}

function getAllSets() {
    return sets; 
  }

  function getSetByNum(setNum) {
    return sets.find(set => set.set_num === setNum);
  }

  function getSetsByTheme(theme) {
    return new Promise((resolve, reject) => {
      try {
        const lowerCaseTheme = theme.toLowerCase();
        const foundSets = sets.filter(set => set.theme.toLowerCase().includes(lowerCaseTheme));
        if (foundSets.length > 0) {
          resolve(foundSets); // Resolve with the found set objects
        } else {
          reject(`Unable to find requested sets with theme: ${theme}`);
        }
      } catch (error) {
        reject(`Error retrieving sets by theme: ${error}`);
      }
    });
  }

module.exports = { Initialize, getAllSets, getSetByNum, getSetsByTheme }