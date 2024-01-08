import { InjectionToken, container } from 'tsyringe'
import { Constructor } from './decotator.interface'
import { CallHandler, SubscribleHandler } from 'cec-client-server'

export type NameOptions = {
  name: string
  aliasName?: string
}

const controllerRecordMap = new Map<
  Constructor,
  {
    controllerName: NameOptions
    callableNames: NameOptions[]
    subscribableNames: NameOptions[]
  }
>()

function getDefaultInfo() {
  return {
    controllerName: {} as any,
    callableNames: [],
    subscribableNames: []
  }
}

export function setControllerName(controller: Constructor, controllerName: NameOptions) {
  if (!controllerRecordMap.has(controller)) {
    controllerRecordMap.set(controller, getDefaultInfo())
  }
  const currentValue = controllerRecordMap.get(controller)!
  controllerRecordMap.set(controller, { ...currentValue, controllerName })
}

export function setCallableName(controller: Constructor, callableName: NameOptions) {
  if (!controllerRecordMap.has(controller)) {
    controllerRecordMap.set(controller, getDefaultInfo())
  }
  const currentValue = controllerRecordMap.get(controller)!
  currentValue.callableNames.push(callableName)
}

export function setSubscribableName(controller: Constructor, subscribableName: NameOptions) {
  if (!controllerRecordMap.has(controller)) {
    controllerRecordMap.set(controller, getDefaultInfo())
  }
  const currentValue = controllerRecordMap.get(controller)!
  currentValue.subscribableNames.push(subscribableName)
}

// TOTEST: 1、功能性测试，2、controller 命名重复
export function getControllers(controllerRegistry: InjectionToken<any>[]) {
  controllerRegistry.forEach(container.resolve.bind(container))

  const controllerRecords = controllerRecordMap.entries()
  const callables: { [name: string]: CallHandler } = {}
  const subscribables: { [name: string]: SubscribleHandler } = {}

  for (const [
    constructor,
    { controllerName, callableNames, subscribableNames }
  ] of controllerRecords) {
    const { name: contrName, aliasName: contrAliasName } = controllerName
    const instance = container.resolve(constructor) as any
    for (const { name: callName, aliasName: callAliasName } of callableNames) {
      const callHandler: CallHandler = (instance[callName] as Function)?.bind(instance)
      const callHandlerName = `${contrAliasName ?? contrName}.${callAliasName ?? callName}`
      callables[callHandlerName] = callHandler
    }
    for (const { name: subscName, aliasName: subscAliasName } of subscribableNames) {
      const subscribleHandler: SubscribleHandler = (instance[subscName] as Function)?.bind(instance)
      const subscribleHandlerName = `${contrAliasName ?? contrName}.${subscAliasName ?? subscName}`
      subscribables[subscribleHandlerName] = subscribleHandler
    }
  }

  return { callables, subscribables }
}
