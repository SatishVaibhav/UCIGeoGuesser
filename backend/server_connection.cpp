#include "crow.h"
#include <map>
#include <string>
#include <fstream>
#include <sstream>
#include <filesystem>

int main() {
    using namespace std;

    crow::App<crow::CORSHandler> app;
    auto& cors = app.get_middleware<crow::CORSHandler>().global();
    cors.origin("*").methods("GET"_method);

    CROW_ROUTE(app, "/home").methods("GET"_method) ([](){        
        
        crow::json::wvalue res;
        
        int id = 1;

        for (const auto& file : filesystem::directory_iterator("./res")) {

            if(file.path().extension() != ".jpg" && file.path().extension() != ".jpeg"){
                continue;
            }

            ifstream in(file.path(), ios::binary);
            stringstream ss;
            ss << in.rdbuf();

            res["images"][to_string(++id)]["image"] =
                "data:image/jpeg;base64," +
                crow::utility::base64encode(ss.str(), ss.str().size());

            ifstream into(file.path().string() + ".supplemental-metadata.json");
            stringstream sst;
            sst << into.rdbuf();

            res["images"][to_string(id)]["metadata"] = crow::json::load(sst.str());
        }
        return res;
    }); 



    app.port(18080).multithreaded().run();
}
