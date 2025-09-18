// Address validation schemas for Fastify
export const addressSchemas = {
  addAddress: {
    body: {
      type: 'object',
      required: ['type', 'addressLine1', 'city', 'country'],
      properties: {
        type: {
          type: 'string',
          enum: ['billing', 'shipping']
        },
        isDefault: {
          type: 'boolean'
        },
        firstName: {
          type: 'string',
          minLength: 1,
          maxLength: 50
        },
        lastName: {
          type: 'string',
          minLength: 1,
          maxLength: 50
        },
        company: {
          type: 'string',
          minLength: 1,
          maxLength: 100
        },
        addressLine1: {
          type: 'string',
          minLength: 1,
          maxLength: 255
        },
        addressLine2: {
          type: 'string',
          minLength: 1,
          maxLength: 255
        },
        city: {
          type: 'string',
          minLength: 1,
          maxLength: 100
        },
        state: {
          type: 'string',
          minLength: 1,
          maxLength: 100
        },
        postalCode: {
          type: 'string',
          minLength: 1,
          maxLength: 20
        },
        country: {
          type: 'string',
          minLength: 2,
          maxLength: 3,
          pattern: '^[A-Z]{2,3}$'
        },
        phone: {
          type: 'string',
          pattern: '^[\\+]?[1-9][\\d]{0,15}$'
        }
      },
      additionalProperties: false
    }
  },

  updateAddress: {
    body: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['billing', 'shipping']
        },
        isDefault: {
          type: 'boolean'
        },
        firstName: {
          type: 'string',
          minLength: 1,
          maxLength: 50
        },
        lastName: {
          type: 'string',
          minLength: 1,
          maxLength: 50
        },
        company: {
          type: 'string',
          minLength: 1,
          maxLength: 100
        },
        addressLine1: {
          type: 'string',
          minLength: 1,
          maxLength: 255
        },
        addressLine2: {
          type: 'string',
          minLength: 1,
          maxLength: 255
        },
        city: {
          type: 'string',
          minLength: 1,
          maxLength: 100
        },
        state: {
          type: 'string',
          minLength: 1,
          maxLength: 100
        },
        postalCode: {
          type: 'string',
          minLength: 1,
          maxLength: 20
        },
        country: {
          type: 'string',
          minLength: 2,
          maxLength: 3,
          pattern: '^[A-Z]{2,3}$'
        },
        phone: {
          type: 'string',
          pattern: '^[\\+]?[1-9][\\d]{0,15}$'
        }
      },
      additionalProperties: false
    }
  },

  listAddresses: {
    querystring: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['billing', 'shipping']
        }
      },
      additionalProperties: false
    }
  },

  addressParams: {
    params: {
      type: 'object',
      required: ['userId'],
      properties: {
        userId: {
          type: 'string',
          format: 'uuid'
        }
      }
    }
  },

  addressIdParams: {
    params: {
      type: 'object',
      required: ['addressId'],
      properties: {
        addressId: {
          type: 'string',
          format: 'uuid'
        }
      }
    }
  },

  userAddressParams: {
    params: {
      type: 'object',
      required: ['userId', 'addressId'],
      properties: {
        userId: {
          type: 'string',
          format: 'uuid'
        },
        addressId: {
          type: 'string',
          format: 'uuid'
        }
      }
    }
  }
};

export const addressResponseSchemas = {
  addressSuccess: {
    type: 'object',
    properties: {
      success: { type: 'boolean', const: true },
      data: {
        type: 'object',
        properties: {
          addressId: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          type: { type: 'string', enum: ['billing', 'shipping'] },
          isDefault: { type: 'boolean' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          company: { type: 'string' },
          addressLine1: { type: 'string' },
          addressLine2: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          postalCode: { type: 'string' },
          country: { type: 'string' },
          phone: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['addressId', 'userId', 'type', 'isDefault', 'addressLine1', 'city', 'country', 'createdAt', 'updatedAt']
      }
    },
    required: ['success', 'data']
  },

  addressError: {
    type: 'object',
    properties: {
      success: { type: 'boolean', const: false },
      error: { type: 'string' },
      errors: {
        type: 'array',
        items: { type: 'string' }
      }
    },
    required: ['success', 'error']
  }
};