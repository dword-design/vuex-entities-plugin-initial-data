export default options => context =>
  context.store.dispatch('entities/inject', options.data)
