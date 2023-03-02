(ns engine.services.setup
  (:require [xstate]
            [goog.functions :as fun]))

(defn get-service []
  (fn [respond listen]
    (listen (fn []
              (respond #js {:type "setup-done"})))
    fun/EMPTY))

