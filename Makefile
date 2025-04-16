CXXFLAGS := -std=c++17 -Wall -Wextra -Werror -Wfatal-errors -pedantic
INCLUDES := -Icrow -Iasio-1.30.2/include

main: backend/main.cpp
	g++ $(CXXFLAGS) backend/main.cpp -o bin/main

server_connection: backend/server_connection.cpp
	g++ $(CXXFLAGS) $(INCLUDES) backend/server_connection.cpp -o bin/server_connection

clean:
	rm -f bin/*