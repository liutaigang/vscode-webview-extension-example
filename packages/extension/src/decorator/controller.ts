import { singleton } from 'tsyringe'
import { setControllerName } from './helper/controller-info-record'
import { Constructor, ClassDecorator } from './helper/decotator.interface'

// TOTEST: 1、功能正常性测试，2、是否为单例
export function controller(aliasName?: string): ClassDecorator {
  return function (target: Constructor) {
    singleton()(target)
    setControllerName(target, { name: target.name, aliasName })
  }
}
