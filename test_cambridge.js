const { fetchDictionaryWord } = require('cambridge-dictionary-api');
(async () => {
    try {
        const result = await fetchDictionaryWord('gladness');
        console.log('gladness:', JSON.stringify(result, null, 2));
    } catch (e) {
        console.error('Error gladness:', e.message);
    }
    
    try {
        const result2 = await fetchDictionaryWord('a long-handled brush');
        console.log('a long-handled brush:', JSON.stringify(result2, null, 2));
    } catch (e) {
        console.error('Error a long-handled brush:', e.message);
    }
})();
