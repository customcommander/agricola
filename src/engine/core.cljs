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
                  #js {:id "work-service-id"
                       :src "work"}
                  :on
                  #js {:work-service-ready
                       #js {:actions (fn [] (print "this is ready to rock"))}}}
             :end
             #js {:type "final"}}}
   machine-opts))

(.start (xstate/interpret (get-machine)))

