module.exports = {
  repositories: {
    product: {
      class: require('../repositories/productRepository'),
      dependencies: []
    }
  },
  services: {
    product: {
      class: require('../services/productService'),
      dependencies: ['repositories.product']
    },
    mail: {
      class: require('../services/mailService'),
      dependencies: []
    },
    encryption: {
      class: require('../services/encryptionService'),
      dependencies: []
    }
  },
  controllers: {
    product: {
      class: require('../controllers/products'),
      dependencies: ['services.product', 'services.mail', 'services.encryption']
    }
  }
};