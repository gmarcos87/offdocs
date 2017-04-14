<template>
   <div id="app">
    <md-toolbar v-if="state.readme === ''">
      <div class="md-toolbar-container">
        <h2 class="md-title" style="flex: 1">Offline docs</h2>
        <md-input-container style="flex: 1" md-inline>
          <label>Search</label>
          <md-input v-model="search" v-on:keyup.enter="changeFilter"></md-input>
        </md-input-container>
        <md-button class="md-icon-button" @click.native="changeFilter">
            Go!
        </md-button>
      </div>
    </md-toolbar>
    <md-toolbar v-else-if="state.readme !== ''">
      <div class="md-toolbar-container">
        <md-button class="md-raised" href="/">🡠 Home</md-button>
      </div>
    </md-toolbar>


    <md-layout md-gutter v-if="state.loaded && state.list === true">
      <md-layout
        style="margin:10px" 
        v-for="package in list"
        v-bind:data="package"
        v-bind:key="package.name">
          <md-card style="flex:1">
            <md-card-header>
            <md-card-header-text>
                <div class="md-title">{{package.name}}</div>
                <div class="md-subhead">{{package.version}}</div>
            </md-card-header-text>
            </md-card-header>
            <md-card-actions>
            <md-button v-bind:href="'./show/'+package.name">Readme offline</md-button>
            <md-button v-bind:href="'https://www.npmjs.com/package/'+package.name" target="_blanck">NPM</md-button>
            </md-card-actions>
        </md-card>
      </md-layout>
      <br>
      <infinite-loading :on-infinite="onInfinite" spinner="waveDots" :distance="distance" ref="infiniteLoading" style="width:100%"></infinite-loading>
    </md-layout>
    <div v-if="state.readme !== ''" v-html="state.readme" class="markdown-body" style="margin:20px;">
  </div>
  

  </div>
</template>

<script>
import request from 'superagent';
import page from 'page';

var store = {
  debug: true,
  state: {
    packages: [],
    loaded: false,
    list: false,
    readme:''
  },
  packagesLoaded(packagesList) {
    this.state.packages = packagesList;
    this.state.loaded = true;
    this.state.list = true;
    this.state.readme = ''
  },
  readme(readme) {
    this.state.readme = readme;
    this.state.list = false;
  }
}

const App = {
  name: 'app',
  data(){ 
     return {
        list: [],
        detail: false,
        distance: 300,
        packages: [],
        filtred: [],
        search: '',
        state: store.state
     }
  },
  methods: {
    onInfinite() {
        if (this.state.packages.length !== this.packages.length) {
          this.initPackages();
        }
        if (this.filtred.length) {
          let temp = []
          for(let i = this.list.length; (i < this.list.length + 20 && i < this.filtred.length); i++) { 
            temp.push(this.filtred[i]);
          }
          this.list = this.list.concat(temp)
          this.$refs.infiniteLoading.$emit('$InfiniteLoading:loaded');
          if (this.list.length === this.filtred.length) {
            this.$refs.infiniteLoading.$emit('$InfiniteLoading:complete');
          }
        } else {
          this.$refs.infiniteLoading.$emit('$InfiniteLoading:complete');
        }
    },
    changeFilter() {
      let search = this.search;
      this.list = [];
      this.filtred = this.packages.filter(function (packageItem) {
        return packageItem.name.indexOf(search.toLowerCase()) > -1
      })
      this.$nextTick(() => {
        this.$refs.infiniteLoading.$emit('$InfiniteLoading:reset');
      });
    },
    initPackages() {
      this.list = [];
      this.packages = this.state.packages.map(x => x);
      this.filtred = this.state.packages.map(x => x);
      this.$nextTick(function() {
        this.$refs.infiniteLoading.$emit('$InfiniteLoading:reset');
      });
    },
  }
}

page('/', function index() {
  request
    .get('/packages')
    .end(function(err,res) {
      store.packagesLoaded(res.body);
    });
});

page('/show/:packageName', function(ctx) {
  request
    .get('/package/' + ctx.params.packageName)
    .end(function(err,res) {
      store.readme(res.body.readme);
    })
});

page();

export default App;
</script>