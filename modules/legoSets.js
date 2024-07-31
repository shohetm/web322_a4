require("dotenv").config();


let sets = []; 

const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const { FOREIGNKEYS } = require("sequelize/lib/query-types");

let sequelize = new Sequelize( 
    process.env.database,
    process.env.user,
    process.env.password,
    {
      host: process.env.host,
      dialect: "postgres",
      port: 5432,
      dialectModule: require("pg"),
      dialectOptions: {
        ssl: { rejectUnauthorized: false },
      },
    }
  );

  const Theme = sequelize.define('Theme', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: Sequelize.STRING
},
    {
        createdAt: false, 
        updatedAt: false,
    }
);

const Set = sequelize.define('Set',{
    set_num: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    num_parts: Sequelize.INTEGER,
    theme_id: Sequelize.INTEGER,
    img_url: Sequelize.STRING
},
{
    createdAt: false,
    updatedAt: false,
}
);

Set.belongsTo(Theme, {foreignKey: 'theme_id'});

function Initialize() {
  return sequelize.sync()
      .then(() => Promise.resolve())
      .catch((error => Promise.reject(error)));
};


function getAllSets() {
    return Set.findAll({ include: [Theme] })
    .then(sets => Promise.resolve(sets))
    .catch(error => Promise.reject(error));
  };

  function getSetByNum(setNum) {
    return Set.findAll({ 
      where: {set_num: setNum},
      include: [Theme]
    })
    .then(sets => {
      if(sets.length > 0) {
        return Promise.resolve(sets[0]);
      }
      else {
        return Promise.reject('Unable to find requested set');
      }
      console.log("found your request:", Theme);
    })
    .catch(error => reject(error));
  };

  function getSetsByTheme(theme) {
    return Set.findAll({include: [Theme], where: { 
      '$Theme.name$': {
          [Sequelize.Op.iLike]: `%${theme}%`
       }
     }
    })  
    .then(sets => Promise.resolve(sets))
    .catch(error => Promise.reject(error));
};   

function getAllThemes() {
  return Theme.findAll()
    .then(themes => Promise.resolve(themes))
    .catch(error => Promise.reject(error));
};

async function addSet(setData) {
  const setDetails = {
    set_num: setData.set_num,
    name: setData.name,
    year: setData.year,
    num_parts: setData.num_parts,
    theme_id: setData.theme_id,
    img_url: setData.img_url
  };

  if (setDetails.year.length !== 4 || isNaN(setDetails.year)) {
    throw new Error('Invalid year format');
  }

  try {
    // Check if the set_num already exists
    const existingSet = await Set.findOne({ where: { set_num: setDetails.set_num } });
    if (existingSet) {
      throw new Error('Set number already exists');
    }

    // If not, create a new set
    const newSet = await Set.create(setDetails);
    return newSet;
  } catch (error) {
    console.error('Error in POST/lego/addSet:', error);
    throw new Error('An error occurred while adding the set.');
  }
};

async function editSet(set_num, setData) {
  return new Promise(async (resolve, reject) => {
    Set.update(setData, { where: { set_num: set_num } })
    .then(() => resolve())
    .catch(err => reject(err.errors[0].message));
  });
}

async function deleteSet(set_num) {
  return new Promise((resolve, reject) => {
      Set.destroy({ where: { set_num: set_num } })
          .then(() => resolve())
          .catch(err => reject(err.errors[0].message));
  });
}

module.exports = { Initialize, getAllSets, getSetByNum, getSetsByTheme, getAllThemes, addSet, editSet, deleteSet }

