
export function MerchantConfig() {
    let config = JSON.parse(localStorage.getItem('currentMerchantInfo'));
    console.log('Fetching Merchant Info: '+JSON.stringify(config));
    return config;
  }