CXXFLAGS= -std=c++17 -Wall -Wextra -Werror -Wfatal-errors -pedantic

main: backend/main.cpp
	g++ $(CXXFLAGS) backend/main.cpp -o bin/main

server_connection: backend/server_connection.cpp
	g++ $(CXXFLAGS) -Icrow -Iasio backend/server_connection.cpp -o bin/server_connection

# You guys will need to download asio urself or you guys can git clone asio and include the include folder in the project.
# That way everyone can use it