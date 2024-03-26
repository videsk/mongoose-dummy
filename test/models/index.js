import user from './user.js';
import organization from './organization.js';
import commit from './commit.js';
import exam from './exam.js';
import product from './product.js';
import cart from './cart.js';

export default function (mongoose) {
    user(mongoose);
    organization(mongoose);
    commit(mongoose);
    exam(mongoose);
    product(mongoose);
    cart(mongoose);
}
