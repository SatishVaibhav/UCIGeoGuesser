#include "crow.h"

int main() {
    crow::App<crow::CORSHandler> app;
    auto& cors = app.get_middleware<crow::CORSHandler>().global();
    cors.origin("*").methods("GET"_method);

    CROW_ROUTE(app, "/home").methods("GET"_method) ([](){
        return "UCI Geoguesser!";
    });

    app.port(18080).multithreaded().run();
}