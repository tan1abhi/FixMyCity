/* eslint-disable */
/* tslint:disable */
// This file is generated. Do not edit it manually.

import * as sdk from "@botpress/sdk"
import * as typings from "./typings/index"
import * as plugins from "./plugins/index"

export * from "./typings/index"
export * from "./plugins/index"

type TPlugins = plugins.TPlugins
type TBot = sdk.DefaultBot<typings.TBot>

export type BotProps = {
  actions: sdk.BotProps<TBot, TPlugins>["actions"]
}

export class Bot extends sdk.Bot<TBot, TPlugins> {
  public constructor(props: BotProps) {
    super({
      actions: props.actions,
      plugins: plugins.plugins
    })
  }
}

// extra types

type AsyncFunction = (...args: any[]) => Promise<any>

export type BotHandlers = sdk.BotHandlers<TBot>

export type EventHandlers = Required<{
  [K in keyof BotHandlers['eventHandlers']]: NonNullable<BotHandlers['eventHandlers'][K]>[number]
}>
export type MessageHandlers = Required<{
  [K in keyof BotHandlers['messageHandlers']]: NonNullable<BotHandlers['messageHandlers'][K]>[number]
}>

export type MessageHandlerProps = Parameters<MessageHandlers['*']>[0]
export type EventHandlerProps = Parameters<EventHandlers['*']>[0]

export type Client = (MessageHandlerProps | EventHandlerProps)['client']
export type ClientOperation = keyof {
  [K in keyof Client as Client[K] extends AsyncFunction ? K : never]: null
}
export type ClientInputs = {
  [K in ClientOperation]: Parameters<Client[K]>[0]
}
export type ClientOutputs = {
  [K in ClientOperation]: Awaited<ReturnType<Client[K]>>
}