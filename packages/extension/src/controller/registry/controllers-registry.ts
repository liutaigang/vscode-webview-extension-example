import { getControllers as getControllerList } from '../../decorator/helper/controller-info-record'
import { AxiosControler } from '../axios.controller'
import { MessageControler } from '../message.controller'
import { VscThemeControler } from '../vsc-theme.controller'

const controllersRegistry = [VscThemeControler, AxiosControler, MessageControler]

export const getControllers = getControllerList.bind({}, controllersRegistry)
