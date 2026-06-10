export default defineAppConfig({
  pages: [
    'pages/schedule/index',
    'pages/scoreboard/index',
    'pages/events/index',
    'pages/statistics/index',
    'pages/match-detail/index',
    'pages/player-list/index',
    'pages/dispute/index',
    'pages/confirm/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1E293B',
    navigationBarTitleText: '智慧体育',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0F172A'
  },
  tabBar: {
    color: '#64748B',
    selectedColor: '#0EA5E9',
    backgroundColor: '#1E293B',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/schedule/index',
        text: '赛程'
      },
      {
        pagePath: 'pages/scoreboard/index',
        text: '记分'
      },
      {
        pagePath: 'pages/events/index',
        text: '事件'
      },
      {
        pagePath: 'pages/statistics/index',
        text: '统计'
      }
    ]
  }
})
