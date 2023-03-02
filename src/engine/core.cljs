(ns engine.core
  (:require [xstate]
            [engine.services.setup :as setup]
            [engine.services.work :as work]))

(def machine-opts
  #js {:actions
       #js {:forward-to-work
            (xstate/forwardTo work/id)

            :forward-to-setup
            (xstate/forwardTo "setup-service")

            :bye
            (fn []
              (println "game over! thank you for playing ;)"))}
       
       :services
       #js {:setup
            setup/get-service

            :work
            work/get-service}})

(defn get-machine []
  (xstate/createMachine
   #js {:context
        #js {:num-workers 2}
        :initial "setup"
        :states
        #js {:setup
             #js {:invoke
                  #js {:id "setup-service"
                       :src "setup"}

                  :on
                  #js {:setup-game
                       #js {:actions "forward-to-setup"}

                       :setup-done
                       #js {:target "work"}}}

             :work
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
  (let [[g start] (main)]
    (start #js {:type "setup-game"})
    (.send g #js {:type "task-selected"})
    (.send g #js {:type "task-done"})
    (.send g #js {:type "task-selected"})
    (.send g #js {:type "task-done"}))
  )

