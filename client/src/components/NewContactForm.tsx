import { useForm } from "react-hook-form";
import { email, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useAuthStore from "@/store/authStore";
import { loginApi } from "@/api/auth";
import { useNavigate, useParams } from 'react-router-dom'
import { addContact } from "@/api/contact";
import { fetchWithAuth } from "@/api/client";


const contactSchema = z.object({
    email: z.email(),
    name: z.string().min(4, "Name must be at least 4 characters"),
});

type LoginFormValues = z.infer<typeof contactSchema>;

export default function NewContactForm() {

    const { id } = useParams();

    const navigate = useNavigate();

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            name: "",
            email: ""
        },
    });

    const onSubmit = async (values: LoginFormValues) => {
        const {email} = form.getValues()

        try {
            const res = await fetchWithAuth("/contacts/check", {
                method: "POST",
                headers : {"content-type" : "application/json"},
                body: JSON.stringify({
                    email: email
                })
            })
            console.log(res)
            if(res === null){
                alert("Contact Email not a registered user!")
                return
            }

            await addContact(res.id!, values.name);
            navigate('/');
            form.reset();
        } catch (err: any) {
            console.error(err);
        }
    };

    // const handleCheck = async () =>{
        // const {email} = form.getValues()
    //     try {
    //         const res = await fetchWithAuth("/contacts/check", {
    //             method: "POST",
    //             headers : {"content-type" : "application/json"},
    //             body: JSON.stringify({
    //                 email: email
    //             })
    //         })
    //         if(res === null){
    //             alert("Contact Email not a registered user!")
    //         }
    //     } catch (error) {
    //         console.error(error)
    //     }
    // }

    return (
        <div className="flex items-center justify-center ">
            <div className="w-full max-w-md  rounded-2xl shadow-md">
                <h2 className="text-2xl font-semibold text-center">Sign In</h2>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <div className="flex flex-row items-center">                                    
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Your contact email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                </div>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (                             
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Your contact name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                
                            )}
                        />
                        <Button type="submit" className="w-full text-white">
                            Register
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
