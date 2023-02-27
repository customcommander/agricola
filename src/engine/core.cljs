(ns engine.core
  (:require [xstate]
            [engine.services.work :as work]))

(def machine-opts
  #js {:actions
       #js {:forward-to-work
            (xstate/forwardTo work/id)}
       
       :services
       #js {:work
            work/get-service}})

(defn get-machine []
  (xstate/createMachine
   #js {:context
        #js {:num-workers 2}
        :initial "work"
        :states
        #js {:work
             #js {:invoke
                  #js {:id work/id
                       :src "work"
                       :onDone
                       #js {:target "end"}}
                  :on
                  #js {:task-selected
                       #js {:actions "forward-to-work"}
                       :task-done
                       #js {:actions "forward-to-work"}}}
             :end
             #js {:entry (fn []
                           (println "game over ;)"))
                  :type "final"}}}
   machine-opts))


(defn main []
  (let [game (xstate/interpret (get-machine))]
    [game
     (fn [evs]
       (.start game)
       (.send game evs))]))


(comment
  (let [[_ start] (main)]
    (start #js [#js {:type "task-selected"}
                #js {:type "task-done"}
                #js {:type "task-selected"}
                #js {:type "task-done"}]))
  )

