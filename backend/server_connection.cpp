#include "crow.h"
int main() {
    crow::SimpleApp app;

    CROW_ROUTE(app, "/") ([](){
        crow::mustache::set_base("frontend");
        auto page = crow::mustache::load_text("main.html");
        return page;
    });

    app.port(18080).multithreaded().run();
    return 0;
}