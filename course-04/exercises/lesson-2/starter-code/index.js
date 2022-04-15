'use strict'

const AWS = require('aws-sdk')

const docClient = new AWS.DynamoDB.DocumentClient()

const groupsTable = process.env.GROUPS_TABLE

exports.handler = async (event) => {
  console.log('Processing event: ', event)

  // TODO: Read and parse "limit" and "nextKey" parameters from query parameters
  // let nextKey // Next key to continue scan operation if necessary
  // let limit // Maximum number of elements to return
  let nextKey;
  let limit;
  
  // from lecture: access query parameters limit and nextKey from event.queryStringParameters
  // const limit = event.queryStringParameters.limit
  // const nextKey = event.queryStringParameters.nextKey

  // HINT: You might find the following method useful to get an incoming parameter value
  // getQueryParameter(event, 'param')
  try {
    limit = getQueryParameter(event, 'limit') || 20
    nextKey = getQueryParameter(event, 'nextKey')
  } catch (e) {
    console.log('Failed to parse query parameters!')
    return {statusCode: 400, 
            headers: {
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(e.message)}
  }
  // limit = getQueryParameter(event, 'limit')
  // nextKey = getQueryParameter(event, 'nextKey')

  // if (limit == undefined || nextKey == undefined) {
  //   return {statusCode: 400, body: 'limit and nextKey are required'}
  // }
  // TODO: Return 400 error if parameters are invalid

  // Scan operation parameters
  const scanParams = {
    TableName: groupsTable,
    Limit: limit,
    ExclusiveStartKey: JSON.parse(decodeURIComponent(nextKey))
  }

  console.log('Scan params: ', scanParams)

  const result = await docClient.scan(scanParams).promise()

  // from lecture
  // const startKey = result.LastEvaluatedKey
  // const moreData = await docClient.scan({
  //   TableName: groupsTable,
  //   Limit: 5,
  //   ExclusiveStartKey: startKey

  // }).promise()

  const items = result.Items

  console.log('Result: ', result)

  // Return result
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    // body always needs to be a string and thus requires JSON.stringify, it seems
    body: JSON.stringify({
      items,
      // Encode the JSON object so a client can return it in a URL as is
      nextKey: encodeNextKey(result.LastEvaluatedKey)
    })
  }
}

/**
 * Get a query parameter or return "undefined"
 *
 * @param {Object} event HTTP event passed to a Lambda function
 * @param {string} name a name of a query parameter to return
 *
 * @returns {string} a value of a query parameter value or "undefined" if a parameter is not defined
 */
function getQueryParameter(event, name) {
  const queryParams = event.queryStringParameters
  if (!queryParams) {
    return undefined
  }

  return queryParams[name]
}

/**
 * Encode last evaluated key using
 *
 * @param {Object} lastEvaluatedKey a JS object that represents last evaluated key
 *
 * @return {string} URI encoded last evaluated key
 */
function encodeNextKey(lastEvaluatedKey) {
  if (!lastEvaluatedKey) {
    return null
  }

  return encodeURIComponent(JSON.stringify(lastEvaluatedKey))
}
