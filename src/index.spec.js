import { endent, replace } from '@dword-design/functions'
import puppeteer from '@dword-design/puppeteer'
import vuexEntities from '@dword-design/vuex-entities'
import esm from 'esm'
import execa from 'execa'
import { Builder, Nuxt } from 'nuxt'
import outputFiles from 'output-files'
import Vue from 'vue'
import Vuex from 'vuex'
import withLocalTmpDir from 'with-local-tmp-dir'

import self from '.'

Vue.use(Vuex)

export default {
  integration: async () => {
    await execa.command('base prepublishOnly')

    return withLocalTmpDir(async () => {
      await outputFiles({
        'pages/index.vue': endent`
          <template>
            <div class="foo">{{ JSON.stringify(foo) }}</div>
          </template>

          <script>
          export default {
            computed: {
              foo() {
                return this.$store.getters['entities/tasks/get']['foo']
              }
            }
          }
          </script>

        `,
        'plugins/plugin.js': endent`
          import vuexEntities from '@dword-design/vuex-entities'

          import self from '${
            require.resolve('../dist') |> replace(/\\/g, '/')
          }'
            
          export default context =>
          vuexEntities({
            plugins: [
              self({ data: [{ id: 'foo', title: 'Foo', typeName: 'Task' }] })
            ],
            types: {
              Task: {},
            },
          })(context.store)
        `,
        'store/index.js': '',
      })

      const nuxt = new Nuxt({
        build: { babel: { babelrc: true } },
        createRequire: () => esm(module),
        dev: false,
        plugins: ['~/plugins/plugin.js'],
      })
      await new Builder(nuxt).build()

      const browser = await puppeteer.launch()
      try {
        await nuxt.listen()

        const page = await browser.newPage()
        await page.goto('http://localhost:3000')

        const foo = await page.waitForSelector('.foo')
        expect(await foo.evaluate(el => el.innerText)).toEqual(
          JSON.stringify({ id: 'foo', title: 'Foo', typeName: 'Task' })
        )
      } finally {
        await nuxt.close()
        await browser.close()
      }
    })
  },
  'no data': () =>
    expect(
      () =>
        new Vuex.Store({
          plugins: [
            vuexEntities({
              plugins: [self()],
              types: {
                Task: {},
              },
            }),
          ],
        })
    ).toThrow(
      'No initial data are defined for vuex-entities-plugin-initial-data.'
    ),
  works: async () => {
    const store = new Vuex.Store({
      plugins: [
        vuexEntities({
          plugins: [
            self({ data: [{ id: 'foo', title: 'Foo', typeName: 'Task' }] }),
          ],
          types: {
            Task: {},
          },
        }),
      ],
    })
    expect({ ...store.state.entities.tasks.value }).toEqual({
      foo: { id: 'foo', title: 'Foo', typeName: 'Task' },
    })
    await store.dispatch('entities/reset')
    expect({ ...store.state.entities.tasks.value }).toEqual({
      foo: { id: 'foo', title: 'Foo', typeName: 'Task' },
    })
  },
}
