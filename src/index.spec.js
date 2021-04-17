import vuexEntities from '@dword-design/vuex-entities'
import Vue from 'vue'
import Vuex from 'vuex'

import self from '.'

Vue.use(Vuex)

export default {
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
