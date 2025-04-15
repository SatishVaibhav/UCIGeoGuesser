#include <httplib.h>
using namespace httplib;
int main() {
    Server svr;
    svr.Get("/data", [](const Request& req, Response& res){
        res.set_content("{\"message\": \"Hello from C++\"}", "application/json");
    });
    svr.listen("0.0.0.0", 8080);
}       