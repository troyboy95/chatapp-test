import { useForm } from "react-hook-form";
import { z } from "zod";
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


const contactSchema = z.object({
    name: z.string().min(4, "Name must be at least 4 characters"),
});

type LoginFormValues = z.infer<typeof contactSchema>;

export default function AddContactForm() {

    const { id } = useParams();

    const navigate = useNavigate();

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            name: "",
        },
    });

    const onSubmit = async (values: LoginFormValues) => {
        try {
            await addContact(id!, values.name);
            navigate('/');
            form.reset();
        } catch (err: any) {
            console.error(err);
        }
    };

    return (
        <div className="flex items-center justify-center ">
            <div className="w-full max-w-md  rounded-2xl shadow-md">
                <h2 className="text-2xl font-semibold text-center">Sign In</h2>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
