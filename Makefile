CXXFLAGS= -Wall -Wextra -Werror -Wfatal-errors -pedantic
main: backend/main.cpp
	g++ $(CXXFLAGS) backend/main.cpp -o bin/main

server_connection: backend/server_connection.cpp
	g++ $(CXXFLAGS) backend/server_connection.cpp -o bin/server_connection

