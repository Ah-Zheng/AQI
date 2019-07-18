Vue.component('weather-card', {
  props: ['weather', 'isfocus'],
  template: '#weatherCard',
  methods: {
    airColor: function (status) {
      let color = '';
      switch (status) {
        case "良好":
          color = '';
          break;
        case "普通":
          color = 'status-aqi2';
          break;
        case "對敏感族群不健康":
          color = 'status-aqi3';
          break;
        case "對所有族群不健康":
          color = 'status-aqi4';
          break;
        case "非常不健康":
          color = 'status-aqi5';
          break;
        case "危害":
          color = 'status-aqi6';
          break;
      }
      return color;
    },
    focusInComponent: function (item) {
      this.$emit('focusevent', item);
    },
    unfocusInComponent: function (item) {
      this.$emit('unfocusevent', item);
    }
  }
});

var app = new Vue({
  el: '#app',
  data: {
    weatherData: [],
    initialWeatherData: [],
    location: [],
    stared: JSON.parse(localStorage.getItem('focusList')) || [],
    filter: '',
    isFocus: false
  },
  computed: {
    // 選擇城市並撈出對應的資料
    filterLocation: function () {
      const vm = this;
      if (vm.filter == '') {
        return vm.weatherData;
      }
      let filterArray = vm.weatherData.filter(function (item) {
        return item.County == vm.filter;
      })
      return filterArray;
    },
  },
  // 請在此撰寫 JavaScript
  created: function () {
    this.getData();
  },
  methods: {
    // 透過AJAX載入資料
    getData: function () {
      const vm = this;
      const api = 'http://opendata2.epa.gov.tw/AQI.json';

      // 使用 jQuery ajax
      $.get(api).then(function (response) {
        vm.weatherData = response;
        vm.initialWeatherData = response.slice(); // 另外複製一個初始資料用於尋找索引值，避免修改資料後無法取得正確的索引值

        // 取出所有城市
        for (let i = 0; i < vm.weatherData.length; i++) {
          vm.location[i] = vm.weatherData[i].County;
        }
        vm.location = Array.from(new Set(vm.location)); // 將county選項中重複的縣市刪除


        if (localStorage.getItem('focusList')) {
          let focusList = JSON.parse(localStorage.getItem('focusList'));

          // 將關注列表的資料更新到最新
          for (let i = 0; i < focusList.length; i++) {
            let index = vm.initialWeatherData.findIndex(function (item) {
              return item.SiteName == focusList[i].SiteName;
            });
            vm.stared[i] = vm.initialWeatherData[index];
          }

          // 當關注列表有值時，將未關注的列表中與已關注相同的值移除
          for (let i = 0; i < focusList.length; i++) {
            let newestIndex = vm.weatherData.findIndex(function (item) {
              return item.SiteName == focusList[i].SiteName;
            });
            vm.weatherData.splice(newestIndex, 1);
          }
        }
      });
    },
    // 新增關注
    addFocus: function (data) {
      const vm = this;
      vm.stared.push(data);
      localStorage.setItem('focusList', JSON.stringify(vm.stared));
      let index = vm.weatherData.findIndex(response => response.SiteName == data.SiteName);
      vm.weatherData.splice(index, 1);
    },
    // 移除關注
    delFocus: function (data) {
      const vm = this;
      let index = vm.stared.findIndex(response => response.SiteName == data.SiteName);
      vm.stared.splice(index, 1);
      localStorage.setItem('focusList', JSON.stringify(vm.stared))
      let newIndex = vm.initialWeatherData.findIndex(response => response.SiteName == data.SiteName);
      vm.weatherData.splice(newIndex, 0, data);
    },
    goTop() {
      $("html, body").animate({ scrollTop: 0 }, 900);
    }
  }
});