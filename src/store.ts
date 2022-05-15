import Vue from "vue"


export const store: {
  functionsBaseUrl: string
  userSelection: UISceneNode[]
  watchAnnotations: boolean
  annotData: AnnotWrapperDefinition[]
  selectedWrapperFrameId: string
  isOnboardingViewOpened: boolean
} = Vue.observable({
  functionsBaseUrl:
    "https://netlify-functions-madebyfabian.netlify.app/.netlify/functions",
  userSelection: [],
  watchAnnotations: false,
  annotData: null,
  selectedWrapperFrameId: null,
  isOnboardingViewOpened: false
})


export const mutations = {
  setUserSelection: (newVal: UISceneNode[]) =>
    (store.userSelection = newVal),

  setWatchAnnotations: (newVal: boolean) =>
    (store.watchAnnotations = newVal),

  setAnnotData: (newVal: AnnotWrapperDefinition[]) =>
    (store.annotData = newVal),
  addAnnotDataNewAnnot: (annotWrapperId: string, newAnnot: object) => {
    store.annotData = store.annotData.map((wrapper: any) => {
      if (wrapper.id !== annotWrapperId) return wrapper
      wrapper.annotData.push(newAnnot)
      return wrapper
    })
  },
  updateAnnotDataAnnot: (
    annotWrapperId: string,
    itemId: string,
    newAnnotObj?: object,
    deleteItem = false
  ) => {
    store.annotData = store.annotData.map((wrapper: any) => {
      if (wrapper.id !== annotWrapperId) return wrapper
      wrapper.annotData = wrapper.annotData
        .map((item: any) => {
          if (item.id !== itemId) return item
          return !deleteItem ? newAnnotObj : null
        })
        .filter((x: any) => x)
      return wrapper
    })
  },
  updateAnnotDataAnnots: (
    annotWrapperId: string,
    newAnnotArr: Array<object>
  ) => {
    store.annotData = store.annotData.map((wrapper: any) => {
      if (wrapper.id !== annotWrapperId) return wrapper
      wrapper.annotData = newAnnotArr
      return wrapper
    })
  },

  setSelectedWrapperFrameId: async (newVal: string) => {
    let watcherStateBefore = JSON.parse(
      JSON.stringify(store.watchAnnotations)
    )
    if (watcherStateBefore === true) {
      await Vue.nextTick()
      store.watchAnnotations = false
      await Vue.nextTick()
    }
    store.selectedWrapperFrameId = newVal
    if (watcherStateBefore === true) {
      await Vue.nextTick()
      store.watchAnnotations = true
    }
  },

  setIsOnboardingViewOpened: (newVal: boolean) =>
    (store.isOnboardingViewOpened = newVal)
}