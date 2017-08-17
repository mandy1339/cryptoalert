(ns ether-light.core
  (:require [clj-http.client :as http]
            [clojure.data.json :as json]
            [clojure.java.io :as io]
            [ring.middleware.reload :refer [wrap-reload]]
            [ring.middleware.format :refer [wrap-restful-format]]
            [ring.middleware.defaults :refer [wrap-defaults api-defaults site-defaults]]
            [ring.middleware.params :refer [wrap-params]]
            [ring.util.response :as response]        ;;from ring
            [ring.util.http-response :as response2]  ;;from metosin
            [compojure.core :refer :all]
            [compojure.route :as route]
            [selmer.parser :as selmer]	;;for html templating
            [noir.util.middleware :as middleware]
            [noir.session :as session]  ;;noir for redirect to work
            [clojure.core.async 
             :as a
             :refer [>! <! >!! <!! go chan buffer close! thread
                     alts! alts!! timeout poll! dropping-buffer sliding-buffer]])
  (:use [clojure.pprint])
  (:use [ring.adapter.jetty])
  (:use [toledohue.hue])
  (:gen-class)
  )


(defroutes the-routes
  (route/resources "/")
  (GET "/" [] (io/file "resources/public/homepage.html"))
)



(defn -main
  "start server for ether webpage"
  []
  (println  "Hello, World!")
  (run-jetty (-> #'the-routes
                 wrap-reload
                 wrap-restful-format
                 wrap-params
                 )
             {:port 5006}))
