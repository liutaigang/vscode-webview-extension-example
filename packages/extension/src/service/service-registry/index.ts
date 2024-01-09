import { MessageService } from '../message.service'
import { registerServices } from 'cec-client-server/decorator'

/**
 * 注意：服务（Service）不一定需要在注册!!!
 *
 * 在这里注册的服务，可以使用服务名（或者服务别名）来使用服务，如：
 *
 * @service()
 *   export class AxiosService {
 *   ...
 * }
 *
 * @controller()
 * export class AxiosControler {
 *   constructor(@inject('AxiosService') private axiosService: any) {}
 *   ...
 * }
 *
 * 服务别名的情况：
 *
 * @service('AxiosUtil')
 *   export class AxiosService {
 *   ...
 * }
 *
 * @controller()
 * export class AxiosControler {
 *   constructor(@inject('AxiosUtil') private axiosUtil: any) {}
 *   ...
 * }
 *
 * 如果正常使用的话，不需要注册服务。如：
 * @controller()
 * export class AxiosControler {
 *   constructor(private axiosService: AxiosService) {}
 *   ...
 * }
 */
registerServices([MessageService])
