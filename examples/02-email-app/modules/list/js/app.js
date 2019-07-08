var App = new Vue({
  el: '#app',
  data() {
    return {
      selected: [],
      items: []
    };
  },
  methods: {
    toggle(index) {
      const i = this.selected.indexOf(index)

      if (i > -1) {
        this.selected.splice(i, 1)
      } else {
        this.selected.push(index)
      }
    },
    setItems(items) {
      this.items = items;
    }
  }
})
