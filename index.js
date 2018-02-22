const fs = require('fs-extra');
const request = require('request-promise-native');
require('dotenv').config();

const baseUrl = process.env.BASE_URL;
if (!baseUrl) throw new Error('Please add a BASE_URL to the .env file');

const downloaded = fs.readJsonSync('./downloaded.json', { throws: false }) || [];

const getUnsavedRecipes = async () => {
  const recipes = await request(`${baseUrl}/api/recipes`, { json: true });
  return downloaded ? recipes.filter(recipe => !downloaded.includes(recipe._id)) : recipes;
};

const saveImage = async (recipe) => {
  const data = await request(recipe.heroImage, { encoding: 'binary' });
  return fs.writeFile(`./images/${recipe._id}.jpg`, data, 'binary');
};

const saveDownloaded = (recipes) => {
  const saved = new Set(downloaded.concat(recipes.map(recipe => recipe._id)));
  return fs.writeJson('downloaded.json', [...saved]);
};

const saveImages = async () => {
  try {
    fs.ensureDirSync('images');
    const recipes = await getUnsavedRecipes();
    await Promise.all(recipes.map(recipe => saveImage(recipe)));
    await saveDownloaded(recipes);
    console.log(`${recipes.length} images downloaded`);
  } catch (error) {
    console.error(error);
  }
};

saveImages();
