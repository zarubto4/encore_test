import Client, {Environment} from "./client"; // import 'hello' service


const client = new Client(Environment("local"));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test() {

    client.my_service_one.hallo1({test: "test", username: "asda", name: "asdasd"})
        .then((response) => {
            console.log("Result:", response);

        }).catch((error) => {
        console.error(error);
    })

}
