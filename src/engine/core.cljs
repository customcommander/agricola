(ns engine.core
  (:require [xstate]
            [engine.services.work :as work]))

(def machine-opts
  #js {:services
       #js {:work work/get-service}})

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
                       #js {:actions (xstate/forwardTo work/id)}
                       :task-done
                       #js {:actions (xstate/forwardTo work/id)}}}
             :end
             #js {:entry (fn []
                           (println "game over"))
                  :type "final"}}}
   machine-opts))

(defn get-service []
  (xstate/interpret (get-machine)))

;; temp
(-> (get-service)
    (.start)
    (.send #js [#js {:type "task-selected"}
                #js {:type "task-done"}
                #js {:type "task-selected"}
                #js {:type "task-done"}]))

