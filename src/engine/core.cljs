(ns engine.core
  (:require [xstate]
            [engine.services.work :as work]))

(def machine-opts
  #js {:actions
       #js {:forward-to-work
            (xstate/forwardTo work/id)

            :bye
            (fn []
              (println "game over! bye ;)"))}
       
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
             #js {:entry "bye"
                  :type "final"}}}
   machine-opts))


(defn main []
  (let [game (xstate/interpret (get-machine))]
    [game #(.send (.start game) %)]))

(comment
  (let [[_ start] (main)]
    (start #js [#js {:type "task-selected"}
                #js {:type "task-done"}
                #js {:type "task-selected"}
                #js {:type "task-done"}]))
)

