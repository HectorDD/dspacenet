'use strict'

const request = require('request-json');
const config = require('./../config');

const sccpClient = request.createClient(config.url);
function spaceWrap(program, path) {
  if (path === '') return program;
  let result = program;
  `${path}`.split('.').forEach(spaceId => {result = `([${result}] ${spaceId})`});
  return result;
}

async function runSCCP(program, path, user) {
  try {
    return await sccpClient.post('/runsccp',{
      config: spaceWrap(program, path), user
    })
  } catch(error) {
    throw error;
  }
}

module.exports = { runSCCP, sccpClient };