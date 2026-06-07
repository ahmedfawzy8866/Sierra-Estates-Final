// Export all Sierra AI Firebase Cloud Functions
const { collectData } = require('./collectData');
const { processDataForApp } = require('./processData');

// Export functions for Firebase deployment
exports.collectData = collectData;
exports.processDataForApp = processDataForApp;

console.log('✅ Sierra AI backend functions loaded: collectData, processDataForApp');
