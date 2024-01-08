import { setCallableName } from './helper/controller-info-record'
import { Constructor, MethodDecorator } from './helper/decotator.interface'

// TOTEST: 1、是否是方法， 2、功能的正常性, 4、方法名不能为 Symbol
export function callable(aliasName?: string): MethodDecorator {
  return function (target, propertyKey, descriptor) {
    if (typeof descriptor.value != 'function') {
      throw Error('The callable decorator should be work at Function')
    }
    if (typeof propertyKey === 'symbol') {
      throw Error('The method key should not Symbol, string or number is expected')
    }
    setCallableName(target.constructor as Constructor, {
      aliasName,
      name: propertyKey as string
    })
  }
}
