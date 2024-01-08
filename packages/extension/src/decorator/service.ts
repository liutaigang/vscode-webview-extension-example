import { DependencyContainer, container, singleton } from 'tsyringe'
import { Constructor, ClassDecorator } from './helper/decotator.interface'

export function service(aliasName?: string): ClassDecorator {
  return function (target: Constructor) {
    singleton()(target)
    const nameToken = aliasName ?? target.name
    container.register(nameToken, {
      useFactory: (dependencyContainer: DependencyContainer) => dependencyContainer.resolve(target)
    })
  }
}
