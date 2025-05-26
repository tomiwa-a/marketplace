module.exports = {
  repositories: {
    product: {
      class: require('../repositories/productRepository'),
      dependencies: []
    },
    category: {
      class: require('../repositories/categoryRepository'),
      dependencies: []
    }
  },
  services: {
    category: {
      class: require('../services/categoryService'),
      dependencies: ['repositories.category', 'services.redis', 'services.logger']
    },
    product: {
      class: require('../services/productService'),
      dependencies: ['repositories.product', 'services.redis', 'services.logger', 'services.user_grpc']
    },
    mail: {
      class: require('../services/mailService'),
      dependencies: []
    },
    encryption: {
      class: require('../services/encryptionService'),
      dependencies: []
    },
    redis:{
      class: require('../services/redisService'),
      dependencies: []
    },
    logger:{
      class: require('../services/loggerService'),
      dependencies: []
    },
    user_grpc:{
      class: require('../services/user_grpcService'),
      dependencies: ['services.logger']
    }
  },
  controllers: {
    product: {
      class: require('../controllers/products'),
      dependencies: ['services.product', 'services.redis', 'services.logger']
    },
    category: {
      class: require('../controllers/categories'),
      dependencies: ['services.category', 'services.redis', 'services.logger']
    }
  }
};