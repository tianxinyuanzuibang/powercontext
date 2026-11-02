/*
 * Copyright (c) 2026 OceanBase.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { describe, expect, it } from 'vitest'
import { PowerContextClient } from '../src/client.ts'
import { registerCommands } from '../src/commands.ts'
import { resolveConfig } from '../src/config.ts'
import { requireService } from '../src/dsh-service.ts'
import type { PluginRuntime } from '../src/invoke.ts'
import { GUIDANCE, registerGuidance } from '../src/guidance.ts'

function runtime(): PluginRuntime {
  const config = resolveConfig({ baseUrl: 'http://127.0.0.1:8000' })
  return {
    client: new PowerContextClient({ baseUrl: config.baseUrl, requestTimeoutMs: 1000, fetch: async () => new Response('{}') }),
    config,
    resolveScope: async () => 'project:demo',
    log: () => undefined,
  }
}

describe('requireService', () => {
  it('returns the named service when present', () => {
    expect(requireService({ get: (name) => name === 'commands' ? { ok: true } : undefined }, 'commands')).toEqual({ ok: true })
  })

  it('rejects a missing service instead of returning undefined', () => {
    expect(() => requireService({ get: () => undefined }, 'commands')).toThrow(
      'powercontext-dsh requires the "commands" service',
    )
  })
})

describe('registerCommands', () => {
  it('fails loudly when the commands service is missing', () => {
    expect(() => registerCommands({ get: () => undefined }, runtime())).toThrow(/commands/)
  })

  it('registers /pc when the commands service is present', () => {
    const registered: Array<{ name: string }> = []
    registerCommands({
      get: (name) => name === 'commands'
        ? { register: (definition: { name: string }) => registered.push(definition) }
        : undefined,
    }, runtime())
    expect(registered.map((item) => item.name)).toEqual(['pc'])
    expect(registered[0]).toHaveProperty('input.hint', expect.any(String))
  })
})

describe('registerGuidance', () => {
  it('fails loudly when the systemPrompt service is missing', () => {
    expect(() => registerGuidance({ get: () => undefined })).toThrow(/systemPrompt/)
  })

  it('registers PowerContext guidance when the systemPrompt service is present', () => {
    const sections: Array<{ name: string; text: string }> = []
    registerGuidance({
      get: (name) => name === 'systemPrompt'
        ? { section: (section: { name: string; text: string }) => sections.push(section) }
        : undefined,
    })
    expect(sections).toEqual([expect.objectContaining({
      name: 'tool:powercontext',
      text: GUIDANCE,
    })])
  })
})
