(ns engine.services.work
  (:require [xstate]
            [cljs-bean.core :refer [bean ->js]]))

(def machine-opts
  #js {:actions
       #js {:notify-ready
            (xstate/sendParent
             #js {:type "work-service-ready"})
            
            :notify-done
            (xstate/sendParent
             #js {:type "work-service-done"})
            
            :workers++
            (xstate/assign
             #(->js (update (bean %) :num-workers inc)))

            :workers--
            (xstate/assign
             #(->js (update (bean %) :num-workers dec)))}
       
       :guards
       #js {:workers-left?
            #(> (:num-workers (bean %)) 0)}})

;; Service definion. Invoked by XState.
(defn get-service [js-ctx]
  (let [{:keys [num-workers]} (bean js-ctx)]
    (xstate/createMachine
     #js {:id "work-service"
          :context
          #js {:num-workers num-workers}
          :initial "init"
          :states
          #js {:init
               #js {:entry "notify-ready"
                    :always
                    #js {:target "select"}}

               :select
               #js {:on
                    #js {:task-selected
                         #js {:target "perform"
                              :actions "workers--"}}}
               :perform
               #js {:on
                    #js {:task-cancelled
                         #js {:target "select"
                              :actions "workers++"}
                         :task-done
                         #js [#js {:target "select" :cond "workers-left?"}
                              #js {:target "done"}]}}
               
               :done
               #js {:type "final"
                    :entry "notify-done"}}}
     machine-opts)))

