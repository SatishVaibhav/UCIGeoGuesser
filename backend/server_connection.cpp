#include "crow.h"
int main() {
    crow::SimpleApp app;

    CROW_ROUTE(app, "/") ([](){
        return "UCI Geoguesser!";
    });

    app.port(18080).multithreaded().run();
    return 0;
}