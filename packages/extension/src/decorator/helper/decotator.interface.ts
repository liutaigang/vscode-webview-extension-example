export type Constructor = { new (...args: any[]): {} }

export type ClassDecorator = <T extends Constructor>(target: T) => T | void

export type PropertyDecorator = (target: Object, propertyKey: string | symbol) => void

export type MethodDecorator = <T>(
  target: Object,
  propertyKey: PropertyKey,
  descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T> | void

export type ParameterDecorator = (
  target: Constructor,
  propertyKey: PropertyKey,
  parameterIndex: number
) => void
