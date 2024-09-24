
 import Client, {Environment} from "./client"; // import 'hello' service

 const client = new Client(Environment("stage"));

function sa() {

    client.my_service_two.test("test", {language: "test"})
        .then((response) => {
            console.log("Result:", response);

        }).catch((error) => {
            console.error(error);
        })

}

