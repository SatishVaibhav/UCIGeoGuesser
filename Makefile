CXXFLAGS := -std=c++17 -Wall -Wextra -Werror -Wfatal-errors -pedantic
INCLUDES := -Icrow -I/opt/homebrew/opt/asio/include

bin:
	mkdir bin

main: backend/main.cpp
	g++ $(CXXFLAGS) backend/main.cpp -o bin/main

server_connection: backend/server_connection.cpp
	g++ $(CXXFLAGS) $(INCLUDES) backend/server_connection.cpp -o bin/server_connection

clean:
	rm -f bin/*