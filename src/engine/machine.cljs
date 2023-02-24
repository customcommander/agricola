(ns engine.machine
  (:require [xstate]))

;; JavaScript definition of the main machine
(defn get-definition []
  (clj->js
   {:initial :setup
    :states
    {:setup
     {:entry :start-setup-service
      :on
      {:setup-game
       {:actions :forward-to-setup-service}
       :setup-done
       {:target :end
        :actions :shutdown-setup-service}}}
     :end
     {:type :final}}}))

