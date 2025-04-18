#include "crow.h"
#include <map>
#include <string>

int main() {
    using namespace std;

    crow::App<crow::CORSHandler> app;
    auto& cors = app.get_middleware<crow::CORSHandler>().global();
    cors.origin("*").methods("GET"_method);



    CROW_ROUTE(app, "/home").methods("GET"_method) ([](){

        // text rn, will have to probably have some id and then if we're storing images on a db
        // just match it and query for that specific one
        map<string, string> images = {{"1" , "Image 1"}, {"2" , "Image 2"}, {"3" , "Image 3"}, {"4" , "Image 4"}};
        
        crow::json::wvalue res;
        
        for(auto& i : images){
            res["images"][i.first] = i.second;
        }
        return res;
    });

    app.port(18080).multithreaded().run();
}